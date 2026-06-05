using FSH.Framework.Shared.Identity.Authorization;
using FSH.Modules.Organization.Contracts.Authorization;
using FSH.Modules.Organization.Contracts.v1.Departments;
using Mediator;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace FSH.Modules.Organization.Features.v1.Departments.GetDepartmentTree;

public static class GetDepartmentTreeEndpoint
{
    internal static RouteHandlerBuilder MapGetDepartmentTreeEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapGet("/departments/tree",
                async (IMediator mediator, CancellationToken ct) =>
                    Results.Ok(await mediator.Send(new GetDepartmentTreeQuery(), ct)))
            .WithName("GetDepartmentTree")
            .WithSummary("Get department tree")
            .RequirePermission(OrganizationPermissions.Departments.View);
    }
}
