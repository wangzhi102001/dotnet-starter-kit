using FSH.Framework.Shared.Identity.Authorization;
using FSH.Modules.Organization.Contracts.Authorization;
using FSH.Modules.Organization.Contracts.v1.Positions;
using Mediator;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace FSH.Modules.Organization.Features.v1.Positions.GetPositions;

public static class GetPositionsEndpoint
{
    internal static RouteHandlerBuilder MapGetPositionsEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapGet("/positions",
                async (IMediator mediator, CancellationToken ct) =>
                    Results.Ok(await mediator.Send(new GetPositionsQuery(), ct)))
            .WithName("GetPositions")
            .WithSummary("Get all positions")
            .RequirePermission(OrganizationPermissions.Positions.View);
    }
}
