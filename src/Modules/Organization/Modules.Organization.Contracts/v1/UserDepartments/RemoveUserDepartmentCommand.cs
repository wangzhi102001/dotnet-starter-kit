using Mediator;

namespace FSH.Modules.Organization.Contracts.v1.UserDepartments;

public sealed record RemoveUserDepartmentCommand(
    string UserId,
    Guid DepartmentId) : ICommand<Unit>;
