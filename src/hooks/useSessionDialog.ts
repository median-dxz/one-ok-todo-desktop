import { useDialog } from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import { useState } from 'react';

export const useSessionDialog = () => {
  const [session, setSession] = useState(nanoid);
  const dialog = useDialog();

  const openDialog = () => {
    setSession(nanoid());
    dialog.setOpen(true);
  };

  return { session, openDialog, dialog };
};
