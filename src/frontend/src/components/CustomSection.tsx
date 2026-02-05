import { useIsCallerAdmin } from '../hooks/useQueries';
import type { HomepageSection } from '../backend';
import EditableCustomSection from './EditableCustomSection';

interface CustomSectionProps {
  section: HomepageSection;
}

export default function CustomSection({ section }: CustomSectionProps) {
  const { data: isAdmin } = useIsCallerAdmin();

  return (
    <section className="py-16 md:py-24 bg-muted/20">
      <div className="container">
        <EditableCustomSection
          section={section}
          isAdmin={isAdmin || false}
        />
      </div>
    </section>
  );
}
