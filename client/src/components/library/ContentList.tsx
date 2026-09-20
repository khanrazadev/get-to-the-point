import ContentListItem from "./ContentListItem";

import type { Content } from "@/types/content";

type ContentListProps = {
  content: Content[];
  isLoading: boolean;
};

function ContentList({
  content,
  isLoading,
}: ContentListProps) {
  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Loading your library...
        </p>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Your analyzed content will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {content.map((item) => (
        <ContentListItem
          key={item.id}
          content={item}
        />
      ))}
    </div>
  );
}

export default ContentList;