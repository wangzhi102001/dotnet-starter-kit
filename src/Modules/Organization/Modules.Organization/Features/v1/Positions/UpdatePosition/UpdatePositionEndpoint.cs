using FSH.Framework.Shared.Identity.Authorization;
using FSH.Modules.Organization.Contracts.Authorization;
using FSH.Modules.Organization.Contracts.v1.Positions;
using Mediator;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace FSH.Modules.Organization.Features.v1.Positions.UpdatePosition;

public static class UpdatePositionEndpoint
{
    internal static RouteHandlerBuilder MapUpdatePositionEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPut("/positions/{positionId:guid}",
                async (Guid positionId, UpdatePositionCommand body, IMediator mediator, CancellationToken ct) =>
                {
                    ArgumentNullException.ThrowIfNull(body);
                    var command = body with { PositionId = positionId };
                    await mediator.Send(command, ct);
                    return Results.NoContent();
                })
            .WithName("UpdatePosition")
            .WithSummary("Update a position")
            .RequirePermission(OrganizationPermissions.Positions.Manage);
    }
}
