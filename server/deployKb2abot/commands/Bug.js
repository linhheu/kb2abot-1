const os = require("os");
const {parseValue} = require("../../helper/helperCommand.js");
const Command = require("./Command.js");

module.exports = class Count extends Command {
	constructor() {
		super({
			keywords: ["bug", "baoloi", "report", "b", "r"],
			help: "[--text=<message> | -t <message>]",
			description: "Dùng gửi góp ý, báo lỗi tới admin"
		});
	}

	execute(args, api, parent, mssg, group) {
		super.execute(args, api, parent, mssg, group);
		const text = parseValue(args, ["text", "t"]);

		if (text) {
			const member = group.memberManager.find({
				id: mssg.senderID
			});
			api.sendMessage(
				`Tôi có góp ý: ${text}${os.EOL}Tin nhắn này được gửi bởi ${member.name}, id: ${member.id}`,
				"100007723935647"
			);
			api.sendMessage(
				`Đã gửi tin nhắn báo cáo với nội dung: ${text}${os.EOL}Cảm ơn bạn đã góp ý!!!`,
				mssg.threadID
			);
		} else {
			api.sendMessage(
				"Bạn thiếu param --text :| (vd: /bug --text test)",
				mssg.threadID
			);
		}
	}
};
