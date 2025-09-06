import { IntegrationSlot } from "@/components/IntegrationSlot";

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Integrations Playground</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IntegrationSlot title="Drop-in Area A">
          {/* Paste or render external element here */}
          <div className="text-earth-muted">Waiting for content…</div>
        </IntegrationSlot>
        <IntegrationSlot title="Drop-in Area B" />
      </div>
    </div>
  );
}
