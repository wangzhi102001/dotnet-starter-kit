using Mediator;

namespace FSH.Modules.Organization.Contracts.v1.Departments;

public sealed record DeleteDepartmentCommand(Guid DepartmentId) : ICommand<Unit>;
