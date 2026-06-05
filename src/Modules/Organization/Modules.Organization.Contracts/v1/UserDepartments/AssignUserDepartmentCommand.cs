using Mediator;

namespace FSH.Modules.Organization.Contracts.v1.UserDepartments;

public sealed record AssignUserDepartmentCommand(
    string UserId,
    Guid DepartmentId,
    Guid? PositionId = null,
    bool IsPrimary = false) : ICommand<Unit>;
