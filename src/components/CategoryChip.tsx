interface CategoryChipProps {
  label: string;
  emoji: string;
  isActive?: boolean;
  onClick: () => void;
}

export const CategoryChip = ({ label, emoji, isActive, onClick }: CategoryChipProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap
        transition-all duration-300 
        ${
          isActive
            ? 'bg-gradient-primary text-primary-foreground shadow-md scale-105'
            : 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105'
        }
      `}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
};
