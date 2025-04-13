import { useState, useCallback } from "react";

/**
 * 운동 상세 모달 상태 관리를 위한 커스텀 훅
 * @param initialWorkoutSeq 초기 선택된 운동 시퀀스 (선택적)
 * @param initialCommentId 초기 선택된 댓글 ID (선택적)
 * @returns 모달 관련 상태와 이벤트 핸들러
 */
const useWorkoutDetail = (
  initialWorkoutSeq: number | null = null,
  initialCommentId?: number
) => {
  const [selectedWorkoutSeq, setSelectedWorkoutSeq] = useState<number | null>(
    initialWorkoutSeq
  );
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    initialCommentId || null
  );
  const [showModal, setShowModal] = useState(!!initialWorkoutSeq);

  // 운동 카드 클릭 핸들러
  const handleWorkoutCardClick = useCallback((seq: number) => {
    setSelectedWorkoutSeq(seq);
    setShowModal(true);
  }, []);

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedWorkoutSeq(null);
    setSelectedCommentId(null);
  }, []);

  return {
    selectedWorkoutSeq,
    selectedCommentId,
    showModal,
    handleWorkoutCardClick,
    handleCloseModal,
    setSelectedWorkoutSeq,
    setSelectedCommentId,
    setShowModal,
  };
};

export default useWorkoutDetail;
