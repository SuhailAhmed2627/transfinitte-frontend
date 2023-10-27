import { SIGN_UP_SUCCESS, LOGIN_SUCCESS } from "./types";

export const signUpSuccess = (data: {
	name: string;
	email: string;
	jwt: string;
}) => {
	return {
		type: SIGN_UP_SUCCESS,
		payload: data,
	};
};

export const loginSuccess = (data: {
	name: string;
	email: string;
	jwt: string;
}) => {
	return {
		type: LOGIN_SUCCESS,
		payload: data,
	};
};
