const mongoPoolPromise = require("../helper/helperMongo.js");
const MemberManager = require("./MemberManager.js");
const Member = require("./Member.js");

module.exports = class Group {
	constructor({
		id,
		owner,
		location,
		game,
		language = "en",
		chat = false,
		emote = false,
		messagesCount = 0,
		live = true,
		listen = true,
		gaming = false,
		prefix = "/"
	} = {}) {
		this.id = id;
		this.owner = owner;
		this.location = location;
		this.game = game;
		this.language = language;
		this.chat = chat;
		this.emote = emote;
		this.messagesCount = messagesCount;
		this.live = live;
		this.listen = listen;
		this.gaming = gaming;
		this.prefix = prefix;

		this.updating = false; // no database structure

		this.memberManager = new MemberManager({
			owner: this.id
		});
		// this.memberManager.downloadFromDtb().then(() => {});
	}

	async downloadFromFacebook(api) {
		this.updating = true;
		const memberIDs = await new Promise(resolve => {
			api.getThreadInfo(this.id, (err, arr) => {
				resolve(arr.participantIDs);
			});
		});
		api.getUserInfo(memberIDs, (error, ret) => {
			this.updating = false;
			if (error) throw error;
			for (let memberID in ret) {
				const member = this.memberManager.add(
					new Member({
						id: memberID,
						owner: this.id
					}),
					{id: memberID}
				);
				Object.assign(member, ret[memberID]);
			}
		});
	}

	sortRank(dependent, growing) {
		if (growing) {
			this.memberManager.items.sort(
				(a, b) => a[dependent] - b[dependent]
			);
		} else {
			this.memberManager.items.sort(
				(a, b) => b[dependent] - a[dependent]
			);
		}
	}

	checkRank(api, memberID) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async resolve => {
			this.sortRank("messagesCount", false);

			const name = (await this.getUserData(api, memberID)).name;

			const indexUser = this.memberManager.find(
				{
					id: memberID
				},
				{
					returnIndex: true
				}
			);
			if (indexUser == -1) {
				resolve({
					name,
					rank: "[không có]"
				});
			} else {
				resolve({
					name,
					rank: indexUser + 1
				});
			}
		});
	}

	async uploadToDtb() {
		const dtb = await mongoPoolPromise();
		dtb.collection("group").updateOne(
			{
				id: this.id
			},
			{
				$set: {
					id: this.id,
					language: this.language,
					chat: this.chat,
					emote: this.emote,
					messagesCount: this.messagesCount,
					location: this.location,
					live: this.live,
					listen: this.listen,
					owner: this.owner
				}
			},
			{
				upsert: true
			}
		);
	}

	getData() {
		return new Promise(async (resolve, reject) => {
			const dtb = await mongoPoolPromise();
			dtb.collection("group")
				.find({
					id: this.id
				})
				.toArray((error, data) => {
					if (error) throw error;
					if (data.length == 1) {
						resolve(data[0]);
					} else {
						reject();
					}
				});
		});
	}
};
