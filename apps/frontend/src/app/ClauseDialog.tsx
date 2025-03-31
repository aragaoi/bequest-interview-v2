import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Clause } from './types';

interface ClauseDialogProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (clause: Clause) => void;
  clauses: Clause[];
}

export const ClauseDialog = ({
  visible,
  onClose,
  onSelect,
  clauses,
}: ClauseDialogProps) => {
  return (
    <DialogComponent
      visible={visible}
      header="Select Clause"
      showCloseIcon={true}
      closeOnEscape={true}
      width="500px"
      target="#document-editor"
      isModal={true}
      close={onClose}
    >
      <div className="space-y-2">
        {clauses.map((clause) => (
          <div
            key={clause.id}
            className="p-3 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => {
              onSelect(clause);
              onClose();
            }}
          >
            {clause.title}
          </div>
        ))}
      </div>
    </DialogComponent>
  );
};
