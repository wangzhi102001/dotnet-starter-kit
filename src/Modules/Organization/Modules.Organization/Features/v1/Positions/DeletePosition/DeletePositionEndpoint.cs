using FSH.Framework.Shared.Identity.Authorization;
using FSH.Modules.Organization.Contracts.Authorization;
using FSH.Modules.Organization.Contracts.v1.Positions;
using Mediator;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace FSH.Modules.Organization.Features.v1.Positions.DeletePosition;

public static class DeletePositionEndpoint
{
    internal static RouteHandlerBuilder MapDeletePositionEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapDelete("/positions/{positionId:guid}",
                async (Guid positionId, IMediator mediator, CancellationToken ct) =>
                {
                    await mediator.Send(new DeletePositionCommand(positionId), ct);
                    return Results.NoContent();
                })
            .WithName("DeletePosition")
            .WithSummary("Delete a position")
            .RequirePermission(OrganizationPermissions.Positions.Manage);
    }
}
