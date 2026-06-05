using FSH.Modules.Organization.Domain;

namespace Organization.Tests.Domain;

public sealed class UserDepartmentAssignmentTests
{
    #region Create

    [Fact]
    public void Create_Should_SetProperties_When_Valid()
    {
        var assignment = UserDepartmentAssignment.Create(
            "user-1", Guid.CreateVersion7(), Guid.CreateVersion7(), isPrimary: true, assignedBy: "admin-1");

        assignment.UserId.ShouldBe("user-1");
        assignment.IsPrimary.ShouldBeTrue();
        assignment.AssignedBy.ShouldBe("admin-1");
        assignment.Id.ShouldNotBe(Guid.Empty);
    }

    [Fact]
    public void Create_Should_Throw_When_UserIdIsNull()
    {
        Should.Throw<ArgumentException>(() =>
            UserDepartmentAssignment.Create(null!, Guid.CreateVersion7()));
    }

    #endregion

    #region SetPrimary

    [Fact]
    public void SetPrimary_Should_UpdateIsPrimary()
    {
        var assignment = UserDepartmentAssignment.Create("user-1", Guid.CreateVersion7(), isPrimary: false);

        assignment.SetPrimary(true);

        assignment.IsPrimary.ShouldBeTrue();
    }

    #endregion
}
