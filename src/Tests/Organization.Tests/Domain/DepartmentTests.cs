using FSH.Modules.Organization.Domain;

namespace Organization.Tests.Domain;

public sealed class DepartmentTests
{
    #region Create

    [Fact]
    public void Create_Should_TrimAndUpperCaseCode_When_Valid()
    {
        Department dept = Department.Create("  Engineering  ", "  eng  ");

        dept.Name.ShouldBe("Engineering");
        dept.Code.ShouldBe("ENG");
        dept.IsActive.ShouldBeTrue();
        dept.Id.ShouldNotBe(Guid.Empty);
    }

    [Fact]
    public void Create_Should_SetParentId_When_Provided()
    {
        Guid parentId = Guid.CreateVersion7();

        Department dept = Department.Create("Backend", "BE", parentId);

        dept.ParentId.ShouldBe(parentId);
    }

    [Fact]
    public void Create_Should_HaveNullParent_When_NotProvided()
    {
        Department dept = Department.Create("Engineering", "ENG");

        dept.ParentId.ShouldBeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_Should_Throw_When_NameIsBlank(string name)
    {
        Should.Throw<ArgumentException>(() => Department.Create(name, "CODE"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_Should_Throw_When_CodeIsBlank(string code)
    {
        Should.Throw<ArgumentException>(() => Department.Create("Name", code));
    }

    [Fact]
    public void Create_Should_Throw_When_NameIsNull()
    {
        Should.Throw<ArgumentException>(() => Department.Create(null!, "CODE"));
    }

    #endregion

    #region Update

    [Fact]
    public void Update_Should_MutateFields_When_Valid()
    {
        Department dept = Department.Create("Old", "OLD");

        dept.Update("New", "NEW", parentId: null, sortOrder: 5, isActive: false);

        dept.Name.ShouldBe("New");
        dept.Code.ShouldBe("NEW");
        dept.SortOrder.ShouldBe(5);
        dept.IsActive.ShouldBeFalse();
        dept.UpdatedAtUtc.ShouldNotBeNull();
    }

    [Fact]
    public void Update_Should_Throw_When_DepartmentIsOwnParent()
    {
        Department dept = Department.Create("Engineering", "ENG");

        Should.Throw<ArgumentException>(() => dept.Update("Eng", "ENG", parentId: dept.Id, sortOrder: 0, isActive: true));
    }

    #endregion
}
