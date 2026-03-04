export const PERSISTENCE_ERROR_EVENT = 'one-ok-todo:persistence-error';

export type PersistenceErrorDetail = {
  title: string;
  description: string;
};

export function reportPersistenceError(description: string, error?: unknown) {
  console.error('[Persistence] ' + description, error);

  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<PersistenceErrorDetail>(PERSISTENCE_ERROR_EVENT, {
      detail: {
        title: '持久化错误',
        description,
      },
    }),
  );
}
