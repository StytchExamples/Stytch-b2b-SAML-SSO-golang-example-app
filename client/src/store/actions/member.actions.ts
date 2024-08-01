import { SET_MEMBER } from "./action.types";
import { MemberInterface } from "../interface";

export interface SetMemberAction {
  type: typeof SET_MEMBER;
  payload: MemberInterface;
}

// Action creator to set member
export const setMember = (member: MemberInterface): SetMemberAction => ({
  type: SET_MEMBER,
  payload: member,
});
