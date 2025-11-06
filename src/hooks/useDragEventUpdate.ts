import { Event } from '../types';

/**
 * 드래그 앤 드롭으로 이벤트 날짜를 변경할 때 사용하는 훅
 * 기존 useEventOperations와 달리 항상 PUT 메서드를 사용하여 업데이트합니다.
 */
export const useDragEventUpdate = () => {
  /**
   * 이벤트의 날짜를 업데이트합니다 (드래그 앤 드롭 전용)
   * @param eventData - 업데이트할 이벤트 (반드시 id 포함)
   * @throws 업데이트 실패 시 에러를 throw하여 호출자가 처리하도록 함
   */
  const updateEventDate = async (eventData: Event): Promise<void> => {
    const response = await fetch(`/api/events/${eventData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error('Failed to update event date');
    }
  };

  return { updateEventDate };
};
