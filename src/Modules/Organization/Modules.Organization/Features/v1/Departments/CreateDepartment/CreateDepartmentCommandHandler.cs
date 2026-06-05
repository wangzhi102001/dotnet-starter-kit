using System.Net;
using FSH.Framework.Core.Exceptions;
using FSH.Modules.Organization.Contracts.v1.Departments;
using FSH.Modules.Organization.Data;
using FSH.Modules.Organization.Domain;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace FSH.Modules.Organization.Features.v1.Departments.CreateDepartment;

public sealed class CreateDepartmentCommandHandler(OrganizationDbContext dbContext)
    : ICommandHandler<CreateDepartmentCommand, Guid>
{
    public async ValueTask<Guid> Handle(CreateDepartmentCommand command, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command);

        string normalizedCode = command.Code.Trim().ToUpperInvariant();

        bool codeTaken = await dbContext.Departments
            .AnyAsync(d => d.Code == normalizedCode, cancellationToken)
            .ConfigureAwait(false);
        if (codeTaken)
        {
            throw new CustomException(
                $"A department with code '{command.Code}' already exists.",
                (IEnumerable<string>?)null,
                HttpStatusCode.Conflict);
        }

        if (command.ParentId.HasValue)
        {
            bool parentExists = await dbContext.Departments
                .AnyAsync(d => d.Id == command.ParentId.Value, cancellationToken)
                .ConfigureAwait(false);
            if (!parentExists)
                throw new NotFoundException($"Parent department {command.ParentId} not found.");
        }

        var department = Department.Create(command.Name, command.Code, command.ParentId, command.SortOrder);

        dbContext.Departments.Add(department);
        await dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return department.Id;
    }
}
