using FSH.Framework.Shared.Identity.Authorization;
using FSH.Modules.Organization.Contracts.Authorization;
using FSH.Modules.Organization.Contracts.v1.UserDepartments;
using Mediator;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace FSH.Modules.Organization.Features.v1.UserDepartments.RemoveUserDepartment;

public static class RemoveUserDepartmentEndpoint
{
    internal static RouteHandlerBuilder MapRemoveUserDepartmentEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapDelete("/users/{userId}/departments/{departmentId:guid}",
                async (string userId, Guid departmentId, IMediator mediator, CancellationToken ct) =>
                {
                    await mediator.Send(new RemoveUserDepartmentCommand(userId, departmentId), ct);
                    return Results.NoContent();
                })
            .WithName("RemoveUserDepartment")
            .WithSummary("Remove a user from a department")
            .RequirePermission(OrganizationPermissions.UserDepartments.Manage);
    }
}
