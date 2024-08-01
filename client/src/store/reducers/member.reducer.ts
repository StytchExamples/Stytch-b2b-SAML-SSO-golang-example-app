import { SET_MEMBER, SetMemberAction } from "../actions";

const initialState = {
  member: null,
};

export const memberReducer = (
  state = initialState,
  action: SetMemberAction
) => {
  switch (action.type) {
    case SET_MEMBER:
      return {
        ...state,
        member: action.payload,
      };
    default:
      return state;
  }
};
