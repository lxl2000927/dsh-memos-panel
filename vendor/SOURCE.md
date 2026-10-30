# Vendored MemOS runtime

Source: @memtensor/memos-cloud-dsh-plugin 0.1.2, lib/index.js.
Upstream: https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin/tree/main/packages/dsh
Original SHA-256: 41a5983e6d03be77c88e6d44cfeffe150e53268772e487434f937eb6343e62ed

The distributed upstream LICENSE is Apache-2.0 and is preserved in this directory.
Changes: resolve dependencies through the installed upstream package; pass an operation-scoped fetch; inspect the current query and completed turn before truncation; expose client error types for fail-closed filtering; allow a private Settings provider for rc.5 without changing the host service. All lifecycle, serialization, timeout, retry, migration and response validation code is retained. No global fetch or SDK is patched.
