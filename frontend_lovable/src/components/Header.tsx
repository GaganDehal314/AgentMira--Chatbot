import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  selectedCount: number;
  onCompare: () => void;
}

export function Header({ selectedCount, onCompare }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
            <img
              src="https://agentmira.ai/wp-content/uploads/2025/05/agent-mira.84f76614acc0fe6d2e66-2-1.png"
              alt="Agent Mira logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              PropertyAI
            </h1>
            <p className="text-xs text-muted-foreground">
              Smart Property Search
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
          )}
          <Button
            onClick={onCompare}
            disabled={selectedCount < 2}
            className={cn(
              'gap-2 transition-all duration-300',
              selectedCount >= 2 && 'btn-compare'
            )}
          >
            <Scale className="w-4 h-4" />
            Compare
            {selectedCount >= 2 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary-foreground/20 rounded text-xs">
                {selectedCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
