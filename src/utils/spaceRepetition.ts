export type WordStatus = 'unknown' | 'unsure' | 'known';

export interface ReviewSchedule {
    nextReviewDate: Date;
    interval: number;
    easeFactor: number;
}

export function calculateNextReview(
    currentInterval: number,
    easeFactor: number,
    status: WordStatus,
    consecutiveCorrect: number
): ReviewSchedule {
    let newInterval: number;
    let newEaseFactor: number = easeFactor;

    switch (status) {
        case 'unknown':
            newInterval = 1;
            newEaseFactor = Math.max(1.3, easeFactor - 0.2);
            break;
        case 'unsure':
            newInterval = Math.max(1, Math.floor(currentInterval * 1.2));
            newEaseFactor = Math.max(1.3, easeFactor - 0.15);
            break;
        case 'known':
            if (consecutiveCorrect > 1) {
                newInterval = Math.floor(currentInterval * easeFactor);
                newEaseFactor = easeFactor + 0.1;
            } else {
                newInterval = Math.floor(currentInterval * 1.5);
            }
            break;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
        nextReviewDate,
        interval: newInterval,
        easeFactor: newEaseFactor,
    };
}