import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { loadDataAtom, persistenceAtom } from '../store/persistence';

// This component handles the application's persistence logic.
export const PersistenceProvider = () => {
  const loadData = useSetAtom(loadDataAtom);
  const persistence = useSetAtom(persistenceAtom);

  // On mount, load the initial data.
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Trigger persistence when the data atoms change.
  useEffect(() => {
    persistence();
  }, [persistence]);

  return null; // This component does not render anything.
};