using Mediator;

namespace FSH.Modules.Organization.Contracts.v1.Departments;

public sealed record CreateDepartmentCommand(
    string Name,
    string Code,
    Guid? ParentId = null,
    int SortOrder = 0) : ICommand<Guid>;
