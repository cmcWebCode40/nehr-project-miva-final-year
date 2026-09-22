export interface DidResolutionResult {
  didDocument: Record<string, unknown>;
  didDocumentMetadata: {
    created: string;
    updated: string;
    deactivated: boolean;
  };
  didResolutionMetadata: {
    contentType: string;
    retrieved: string;
  };
}
