using FSH.Framework.Shared.Identity.Authorization;
using FSH.Framework.Web.Idempotency;
using FSH.Modules.Organization.Contracts.Authorization;
using FSH.Modules.Organization.Contracts.v1.Positions;
using Mediator;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace FSH.Modules.Organization.Features.v1.Positions.CreatePosition;

public static class CreatePositionEndpoint
{
    internal static RouteHandlerBuilder MapCreatePositionEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPost("/positions",
                async (CreatePositionCommand command, IMediator mediator, CancellationToken ct) =>
                    Results.Ok(await mediator.Send(command, ct)))
            .WithName("CreatePosition")
            .WithSummary("Create a position")
            .RequirePermission(OrganizationPermissions.Positions.Manage)
            .WithIdempotency();
    }
}
