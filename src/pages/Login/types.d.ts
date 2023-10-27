/* eslint-disable no-unused-vars */
enum IntendedAction {
	Login,
	Signup,
	None,
}

enum AuthStatusEnum {
	PRE = "PRE", // Wait for UI to trigger
	START = "START", // UI triggered, start auth
	WAITING = "WAITING", // waiting for auth response
	ACCEPTED = "ACCEPTED", // auth accepted, waiting for server response
	REJECTED = "REJECTED", // auth rejected
	AUTH = "AUTH", // auth success, waiting for server response
	ERROR = "ERROR", // auth error
	SUCCESS = "SUCCESS", // auth success from server
}

export { TokenResponseType, IntendedAction, AuthStatusEnum };
