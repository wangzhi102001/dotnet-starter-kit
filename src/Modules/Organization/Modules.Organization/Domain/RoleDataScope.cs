using System.Collections.ObjectModel;
using FSH.Framework.Core.Domain;
using FSH.Modules.Organization.Contracts;

namespace FSH.Modules.Organization.Domain;

public sealed class RoleDataScope : BaseEntity<Guid>
{
    private RoleDataScope() { }

    public string RoleName { get; private set; } = default!;
    public DataScope Scope { get; private set; } = DataScope.CurrentOnly;
    public Collection<Guid>? CustomDepartmentIds { get; private set; }

    public static RoleDataScope Create(string roleName, DataScope scope, Collection<Guid>? customDepartmentIds = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(roleName);

        return new RoleDataScope
        {
            Id = Guid.CreateVersion7(),
            RoleName = roleName,
            Scope = scope,
            CustomDepartmentIds = scope == DataScope.Custom
                ? customDepartmentIds ?? []
                : null
        };
    }

    public void Update(DataScope scope, Collection<Guid>? customDepartmentIds = null)
    {
        Scope = scope;
        CustomDepartmentIds = scope == DataScope.Custom
            ? customDepartmentIds ?? []
            : null;
    }
}
