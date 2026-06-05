using Mediator;

namespace FSH.Modules.Organization.Contracts.v1.Departments;

public sealed record UpdateDepartmentCommand(
    Guid DepartmentId,
    string Name,
    string Code,
    Guid? ParentId = null,
    int SortOrder = 0,
    bool IsActive = true) : ICommand<Unit>;
