using System.Security.Claims;
using FSH.Modules.Organization.Contracts.Dtos;
using FSH.Modules.Organization.Services;
using NSubstitute;

namespace Organization.Tests.Services;

public sealed class OrganizationClaimsTransformerTests
{
    [Fact]
    public async Task TransformAsync_Should_AddDepartmentClaims_When_UserHasAssignments()
    {
        var userId = Guid.CreateVersion7().ToString();
        var deptId = Guid.CreateVersion7();
        var positionId = Guid.CreateVersion7();

        var assignments = new List<UserDepartmentDto>
        {
            new(userId, deptId, "Engineering", positionId, "Manager", IsPrimary: true, DateTimeOffset.UtcNow)
        };

        var userDeptService = Substitute.For<IUserDepartmentService>();
        userDeptService.GetAssignmentsAsync(userId).Returns(assignments);

        var transformer = new OrganizationClaimsTransformer(userDeptService);

        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, "testuser")
        ], "TestAuth"));

        var result = await transformer.TransformAsync(principal);

        var deptIdsClaim = result.FindFirst("department_ids");
        deptIdsClaim.ShouldNotBeNull();
        deptIdsClaim!.Value.ShouldBe(deptId.ToString());

        var primaryDeptClaim = result.FindFirst("primary_department_id");
        primaryDeptClaim.ShouldNotBeNull();
        primaryDeptClaim!.Value.ShouldBe(deptId.ToString());

        var positionClaim = result.FindFirst("position_id");
        positionClaim.ShouldNotBeNull();
        positionClaim!.Value.ShouldBe(positionId.ToString());
    }

    [Fact]
    public async Task TransformAsync_Should_NotModify_When_NotAuthenticated()
    {
        var userDeptService = Substitute.For<IUserDepartmentService>();
        var transformer = new OrganizationClaimsTransformer(userDeptService);

        var principal = new ClaimsPrincipal(new ClaimsIdentity());

        var result = await transformer.TransformAsync(principal);

        result.Identities.ShouldHaveSingleItem();
        result.Identities.First().Claims.ShouldBeEmpty();
    }

    [Fact]
    public async Task TransformAsync_Should_NotModify_When_NoUserId()
    {
        var userDeptService = Substitute.For<IUserDepartmentService>();
        var transformer = new OrganizationClaimsTransformer(userDeptService);

        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.Name, "testuser")
        ], "TestAuth"));

        var result = await transformer.TransformAsync(principal);

        result.FindFirst("department_ids").ShouldBeNull();
    }

    [Fact]
    public async Task TransformAsync_Should_NotModify_When_NoAssignments()
    {
        var userId = Guid.CreateVersion7().ToString();
        var userDeptService = Substitute.For<IUserDepartmentService>();
        userDeptService.GetAssignmentsAsync(userId).Returns([]);

        var transformer = new OrganizationClaimsTransformer(userDeptService);

        var principal = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, userId)
        ], "TestAuth"));

        var result = await transformer.TransformAsync(principal);

        result.FindFirst("department_ids").ShouldBeNull();
    }
}
