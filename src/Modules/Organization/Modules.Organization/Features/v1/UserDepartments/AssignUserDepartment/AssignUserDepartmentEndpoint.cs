using FSH.Framework.Shared.Identity.Authorization;
using FSH.Modules.Organization.Contracts.Authorization;
using FSH.Modules.Organization.Contracts.v1.UserDepartments;
using Mediator;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace FSH.Modules.Organization.Features.v1.UserDepartments.AssignUserDepartment;

public static class AssignUserDepartmentEndpoint
{
    internal static RouteHandlerBuilder MapAssignUserDepartmentEndpoint(this IEndpointRouteBuilder endpoints)
    {
        return endpoints.MapPost("/users/{userId}/departments",
                async (string userId, AssignUserDepartmentCommand command, IMediator mediator, CancellationToken ct) =>
                {
                    ArgumentNullException.ThrowIfNull(command);
                    var merged = command with { UserId = userId };
                    await mediator.Send(merged, ct);
                    return Results.NoContent();
                })
            .WithName("AssignUserDepartment")
            .WithSummary("Assign a user to a department")
            .RequirePermission(OrganizationPermissions.UserDepartments.Manage);
    }
}
