import '@syncfusion/ej2-icons/styles/material.css';

type ButtonVariant = 'text' | 'minimal';

interface AddClauseButtonProps {
  onClick: () => void;
  title: string;
  variant?: ButtonVariant;
  text?: string;
}

const buttonStyles = {
  base: 'inline-flex items-center justify-center px-2 hover:bg-gray-100 transition-colors group relative',
  text: 'h-5 text-gray-600 gap-1.5 text-xs rounded-full border border-gray-300 hover:border-gray-400',
  minimal:
    'h-3 px-3 py-0.5 text-gray-500 text-[10px] rounded-full border border-gray-200 hover:border-gray-300',
};

const iconStyle = { fontSize: '8px' };

const TextVariant = ({ text }: { text: string }) => (
  <>
    <span className="e-icons e-plus" style={iconStyle} />
    <span>{text}</span>
  </>
);

const MinimalVariant = () => (
  <>
    <span
      className="e-icons e-plus opacity-0 group-hover:opacity-100 transition-opacity absolute"
      style={iconStyle}
    />
    <span
      className="e-icons e-more-horizontal-1 group-hover:opacity-0 transition-opacity"
      style={iconStyle}
    />
  </>
);

export const AddClauseButton = ({
  onClick,
  title,
  variant = 'minimal',
  text = 'Add Clause',
}: AddClauseButtonProps) => (
  <div className="flex justify-center">
    <button
      onClick={onClick}
      className={`${buttonStyles.base} ${buttonStyles[variant]}`}
      title={title}
    >
      {variant === 'text' ? <TextVariant text={text} /> : <MinimalVariant />}
    </button>
  </div>
);
