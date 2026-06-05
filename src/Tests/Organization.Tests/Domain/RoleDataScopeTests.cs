using FSH.Modules.Organization.Contracts;
using FSH.Modules.Organization.Domain;

namespace Organization.Tests.Domain;

public sealed class RoleDataScopeTests
{
    #region Create

    [Fact]
    public void Create_Should_StoreCustomDepartmentIds_When_ScopeIsCustom()
    {
        var deptIds = new List<Guid> { Guid.CreateVersion7(), Guid.CreateVersion7() };

        var scope = RoleDataScope.Create("DeptManager", DataScope.Custom, [.. deptIds]);

        scope.RoleName.ShouldBe("DeptManager");
        scope.Scope.ShouldBe(DataScope.Custom);
        scope.CustomDepartmentIds.ShouldNotBeNull();
        scope.CustomDepartmentIds!.Count.ShouldBe(2);
    }

    [Fact]
    public void Create_Should_NullifyCustomDepartmentIds_When_ScopeIsNotCustom()
    {
        var scope = RoleDataScope.Create("Admin", DataScope.AllDepartments);

        scope.CustomDepartmentIds.ShouldBeNull();
    }

    [Fact]
    public void Create_Should_Throw_When_RoleNameIsNull()
    {
        Should.Throw<ArgumentException>(() => RoleDataScope.Create(null!, DataScope.CurrentOnly));
    }

    #endregion

    #region Update

    [Fact]
    public void Update_Should_SwitchScopeAndUpdateCustomIds()
    {
        var scope = RoleDataScope.Create("Manager", DataScope.CurrentOnly);
        var deptIds = new List<Guid> { Guid.CreateVersion7() };

        scope.Update(DataScope.Custom, [.. deptIds]);

        scope.Scope.ShouldBe(DataScope.Custom);
        scope.CustomDepartmentIds.ShouldNotBeNull();
        scope.CustomDepartmentIds!.Count.ShouldBe(1);
    }

    [Fact]
    public void Update_Should_NullifyCustomIds_When_ChangingFromCustom()
    {
        var deptIds = new List<Guid> { Guid.CreateVersion7() };
        var scope = RoleDataScope.Create("Manager", DataScope.Custom, [.. deptIds]);

        scope.Update(DataScope.AllDepartments);

        scope.Scope.ShouldBe(DataScope.AllDepartments);
        scope.CustomDepartmentIds.ShouldBeNull();
    }

    #endregion
}
