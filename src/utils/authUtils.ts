import { store } from "../store/store";

/**
 * 현재 사용자의 로그인 상태를 확인합니다.
 * @returns 로그인 상태 여부 (boolean)
 */
export const isLoggedIn = (): boolean => {
  const state = store.getState();
  return !!state.auth?.userInfo?.userSeq;
};

/**
 * 현재 로그인한 사용자의 ID를 반환합니다.
 * @returns 사용자 ID 또는 undefined
 */
export const getCurrentUserId = (): number | undefined => {
  const state = store.getState();
  return state.auth?.userInfo?.userSeq;
};
