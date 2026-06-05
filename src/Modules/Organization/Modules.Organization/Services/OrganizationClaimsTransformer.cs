using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace FSH.Modules.Organization.Services;

internal sealed class OrganizationClaimsTransformer : IClaimsTransformation
{
    private readonly IUserDepartmentService _userDeptService;

    public OrganizationClaimsTransformer(IUserDepartmentService userDeptService)
    {
        _userDeptService = userDeptService;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not { IsAuthenticated: true })
            return principal;

        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return principal;

        var assignments = await _userDeptService.GetAssignmentsAsync(userId).ConfigureAwait(false);
        if (assignments is null or { Count: 0 })
            return principal;

        var identity = new ClaimsIdentity("Organization");
        identity.AddClaim(new Claim("department_ids",
            string.Join(',', assignments.Select(a => a.DepartmentId))));
        identity.AddClaim(new Claim("primary_department_id",
            assignments.FirstOrDefault(a => a.IsPrimary)?.DepartmentId.ToString() ?? string.Empty));

        var positionId = assignments.FirstOrDefault(a => a.IsPrimary)?.PositionId;
        if (positionId is not null)
            identity.AddClaim(new Claim("position_id", positionId.Value.ToString()));

        principal.AddIdentity(identity);
        return principal;
    }
}
