using FSH.Modules.Organization.Domain;

namespace Organization.Tests.Domain;

public sealed class PositionTests
{
    #region Create

    [Fact]
    public void Create_Should_TrimAndUpperCaseCode_When_Valid()
    {
        Position pos = Position.Create("  Manager  ", "  mgr  ");

        pos.Name.ShouldBe("Manager");
        pos.Code.ShouldBe("MGR");
        pos.IsActive.ShouldBeTrue();
        pos.Id.ShouldNotBe(Guid.Empty);
    }

    [Fact]
    public void Create_Should_Throw_When_NameIsBlank()
    {
        Should.Throw<ArgumentException>(() => Position.Create("", "CODE"));
    }

    #endregion

    #region Update

    [Fact]
    public void Update_Should_MutateFields_When_Valid()
    {
        Position pos = Position.Create("Old", "OLD", sortOrder: 1);

        pos.Update("New", "NEW", sortOrder: 9, isActive: false);

        pos.Name.ShouldBe("New");
        pos.Code.ShouldBe("NEW");
        pos.SortOrder.ShouldBe(9);
        pos.IsActive.ShouldBeFalse();
    }

    #endregion
}
