# Building agent-ui with Konflux

This document explains how to build the `migration-planner-agent-ui` container image using Konflux, Red Hat's CI/CD platform.

## Why Konflux?

Building the agent-ui image through Konflux ensures:
- The image is published to `quay.io/redhat-user-workloads/assisted-migration-tenant/`
- The image is in a trusted registry that passes Enterprise Contract (EC) validation
- The agent container can use this UI image as a base without EC violations
- Consistent build process with other Red Hat components

## Architecture

The build process uses a multi-stage Dockerfile:

1. **Build Stage**: Uses UBI9 Node.js 20 image to:
   - Install dependencies with Yarn
   - Build all workspaces with `yarn build:all`
   - Generate the production build in `apps/agent-ui/dist`

2. **Final Stage**: Creates a minimal `FROM scratch` image containing only the built UI assets

## Konflux Configuration

### Directory Structure

```
migration-planner-ui/
├── .tekton/
│   ├── migration-planner-agent-ui-pull-request.yaml  # PR builds
│   └── migration-planner-agent-ui-push.yaml          # Main branch builds
└── Dockerfile                                         # Multi-stage build
```

### Pipeline Files

#### Pull Request Pipeline (`.tekton/migration-planner-agent-ui-pull-request.yaml`)
- Triggers on PRs targeting `main` branch
- Builds image tagged as: `on-pr-{{revision}}`
- Runs EC validation on the built image
- Does not push to production registry

#### Push Pipeline (`.tekton/migration-planner-agent-ui-push.yaml`)
- Triggers on pushes to `main` branch
- Builds image tagged with commit SHA: `{{revision}}`
- Images expire after 5 days (configurable)
- Pushes to: `quay.io/redhat-user-workloads/assisted-migration-tenant/migration-planner-agent-ui`

## Setting Up in Konflux

### Prerequisites

1. **Konflux Application**: Ensure `assisted-migration` application exists
2. **Component Registration**: Register the `migration-planner-agent-ui` component
3. **GitHub Integration**: Configure Pipelines as Code (PaC) integration
4. **Quay Access**: Verify push permissions to the namespace

### Onboarding Steps

1. **Create the Application** (if not exists):
   ```bash
   kubectl create -f - <<EOF
   apiVersion: appstudio.redhat.com/v1alpha1
   kind: Application
   metadata:
     name: assisted-migration
     namespace: assisted-migration-tenant
   spec:
     displayName: Assisted Migration
   EOF
   ```

2. **Create the Component**:
   ```bash
   kubectl create -f - <<EOF
   apiVersion: appstudio.redhat.com/v1alpha1
   kind: Component
   metadata:
     name: migration-planner-agent-ui
     namespace: assisted-migration-tenant
   spec:
     application: assisted-migration
     componentName: migration-planner-agent-ui
     source:
       git:
         url: https://github.com/kubev2v/migration-planner-ui
         revision: main
         context: ./
         dockerfileUrl: Dockerfile
   EOF
   ```

3. **Configure Pipelines as Code**:
   - Install the GitHub App for Konflux
   - Grant access to the `migration-planner-ui` repository
   - The `.tekton/*.yaml` files will be automatically detected

## Image Tags and Lifecycle

### PR Builds
- **Tag format**: `on-pr-<commit-sha>`
- **Example**: `quay.io/redhat-user-workloads/assisted-migration-tenant/migration-planner-agent-ui:on-pr-abc1234`
- **Lifecycle**: Temporary, used for testing

### Main Branch Builds
- **Tag format**: `<commit-sha>`
- **Example**: `quay.io/redhat-user-workloads/assisted-migration-tenant/migration-planner-agent-ui:abc1234567`
- **Lifecycle**: Expires after 5 days (configurable via `image-expires-after` parameter)
- **Latest**: Can optionally tag as `latest` for easier consumption

## Using the Image in the Agent

Once built through Konflux, the agent Dockerfile can reference this image:

```dockerfile
FROM quay.io/redhat-user-workloads/assisted-migration-tenant/migration-planner-agent-ui:latest

# Add agent-specific layers
COPY agent-binary /usr/local/bin/agent
CMD ["/usr/local/bin/agent"]
```

This will pass EC validation because the base image comes from a trusted registry.

## Troubleshooting

### Build Failures

**Symptom**: Pipeline fails during `yarn install` or `yarn build:all`

**Solutions**:
- Check that all dependencies are properly declared in `package.json`
- Verify Node.js version compatibility (pipeline uses Node 20)
- Check build logs for specific errors

### Image Not Found

**Symptom**: Agent build can't pull the UI image

**Solutions**:
- Verify the image was pushed successfully
- Check Quay repository permissions
- Ensure the image hasn't expired (check `image-expires-after` setting)
- Use a specific SHA tag instead of `latest` for reproducibility

### EC Validation Failures

**Symptom**: Enterprise Contract checks fail on the agent image

**Solutions**:
- Verify the UI image is being built through Konflux (not GitHub Actions)
- Check that the image registry is `quay.io/redhat-user-workloads/`
- Review EC policy configuration for any custom exclusions needed

## Customization

### Adjusting Build Parameters

Edit the `.tekton/*.yaml` files to customize:

- **Storage size**: Change `storage: 1Gi` in workspace volumeClaimTemplate
- **Image expiration**: Modify `image-expires-after` parameter (e.g., `10d`, `30d`)
- **Build context**: Change `path-context` if Dockerfile is in a subdirectory
- **Pipeline triggers**: Modify `pipelinesascode.tekton.dev/on-cel-expression` for different trigger conditions

### Using Hermetic Builds

For fully hermetic builds (no network access during build), update the pipeline to use:

```yaml
pipelineRef:
  name: docker-build-hermetic
```

This requires pre-fetching all dependencies.

## Comparison with GitHub Actions

| Aspect | GitHub Actions | Konflux |
|--------|---------------|---------|
| **Registry** | `quay.io/assisted-migration/` | `quay.io/redhat-user-workloads/` |
| **EC Validation** | ❌ May fail | ✅ Passes by default |
| **Build Environment** | GitHub runners | Red Hat infrastructure |
| **Integration** | Good for public repos | Required for Red Hat products |
| **Trigger** | Push/Release events | Push/PR events via PaC |

## Migration from GitHub Actions

If you're migrating from the existing GitHub Actions workflow:

1. **Keep both initially**: Run both pipelines in parallel during transition
2. **Update agent references**: Change agent Dockerfile to reference Konflux image
3. **Test thoroughly**: Verify EC validation passes
4. **Deprecate GitHub workflow**: Once stable, disable or remove `.github/workflows/publish.yml`

## References

- [Konflux Documentation](https://konflux-ci.dev/docs/)
- [Pipelines as Code](https://pipelinesascode.com/)
- [Enterprise Contract](https://enterprisecontract.dev/)
- [UBI Images](https://catalog.redhat.com/software/containers/ubi9/nodejs-20/632e91d03a1d4f1e6b3e8ce6)

