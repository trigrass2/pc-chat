import storage from './storage';
const state = {
	// session: null, // 登录权限
	// loading: false, // 路由跳转过程loading
	gUserInfo: storage.getLocalItem('gUserInfo') || {}, // 群聊当前登录用户信息
	sUserInfo: storage.getLocalItem('sUserInfo') || {}, // 会话当前登录用户信息
	// 登录
	rememberPsw: storage.getLocalItem('rememberPsw'), // 登录-是否记住密码
	loginPsw: storage.getLocalItem('loginPsw'), // 登录-密码
	userList: storage.getLocalItem('userList'), // 登录-账号列表
	// 长轮询——未读私聊消息
	unReadPrivateMsg: null,
	// 长轮询——未读群聊消息
	unReadGroupMsg: null,
	// 长轮询——群操作
	groupOperate: null,
	// 聊天列表
	// 当前聊天对象信息
	// sessionInfo: null, // 会话信息
	// 聊天
	conRightShow: storage.getSessionItem('conRightShow') || false,  // 右侧栏显影
	chatType: storage.getSessionItem('chatType'),  // 聊天类型
	// sessionMsgList: [],  // 会话消息列表
	groupMsgList: null, // 群聊消息列表
	privateMsgList: [], // 私聊消息消息
	sessionImg: [], // 会话图片预览
	groupImg: [],  // 群聊图片预览
	privateImg: [],  // 私聊图片预览
	friendImg: [],  // 同伴图片预览
	faceImgShow: false,  // 表情包显/隐
	materialShow: false,  // 图文显/隐
	groupInfoShow: storage.getSessionItem('groupInfoShow'),  // 群聊显隐
	sessionInfoShow: storage.getSessionItem('sessionInfoShow'),  // 会话显隐
	privateInfoShow: storage.getSessionItem('privateInfoShow'),  // 私聊显隐
	lockText: '', // 是否锁住发送消息按钮 
	sessionList: null, // 会话列表
	friendList: null, // 同伴列表
	groupList: null, // 群聊列表
	privateList: null,  // 私聊列表
	atMeList: null,	// @我列表
	memberList: null, // 群成员列表
	sendMsgList: []  // 发送的消息列表(发送中-失败)
}

export default state
