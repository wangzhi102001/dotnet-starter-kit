using FSH.Framework.Shared.Identity.Authorization;
using FSH.Modules.Organization.Contracts.Authorization;
using FSH.Modules.Organization.Contracts.v1.Departments;
using Mediator;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace FSH.Modules.Organization.Features.v1.Departments.UpdateDepartment;

public static class UpdateDepartmentEndpoint
{
    internal static RouteHandlerBuilder MapUpdateDepartmentEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPut("/departments/{departmentId:guid}",
                async (Guid departmentId, UpdateDepartmentCommand body, IMediator mediator, CancellationToken ct) =>
                {
                    ArgumentNullException.ThrowIfNull(body);
                    var command = body with { DepartmentId = departmentId };
                    await mediator.Send(command, ct);
                    return Results.NoContent();
                })
            .WithName("UpdateDepartment")
            .WithSummary("Update a department")
            .RequirePermission(OrganizationPermissions.Departments.Manage);
    }
}
