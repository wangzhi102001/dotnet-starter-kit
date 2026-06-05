using FSH.Framework.Shared.Identity.Authorization;
using FSH.Modules.Organization.Contracts.Authorization;
using FSH.Modules.Organization.Contracts.v1.Departments;
using Mediator;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace FSH.Modules.Organization.Features.v1.Departments.GetDepartmentById;

public static class GetDepartmentByIdEndpoint
{
    internal static RouteHandlerBuilder MapGetDepartmentByIdEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapGet("/departments/{departmentId:guid}",
                async (Guid departmentId, IMediator mediator, CancellationToken ct) =>
                    Results.Ok(await mediator.Send(new GetDepartmentByIdQuery(departmentId), ct)))
            .WithName("GetDepartmentById")
            .WithSummary("Get a department by id")
            .RequirePermission(OrganizationPermissions.Departments.View);
    }
}
