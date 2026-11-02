# Vendored MemOS runtime

Source: @memtensor/memos-cloud-dsh-plugin 0.1.2, lib/index.js.
Upstream: https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin/tree/main/packages/dsh
Original SHA-256: 41a5983e6d03be77c88e6d44cfeffe150e53268772e487434f937eb6343e62ed

The distributed upstream LICENSE is Apache-2.0 and is preserved in this directory.
Changes: resolve dependencies through the installed upstream package, with a running-host-entry fallback for optional SDK peers; pass an operation-scoped fetch; inspect the current query and completed turn before truncation; expose client error types for fail-closed filtering; allow a private Settings provider for rc.5 without changing the host service; add six optional relevance-filter settings and filter projected recall before injection, respecting cancellation. Upstream lifecycle structure, serialization, retries, migration and response validation are retained. No global fetch, module path or SDK is patched. Temporary diagnostic file writes are not included in the release.
