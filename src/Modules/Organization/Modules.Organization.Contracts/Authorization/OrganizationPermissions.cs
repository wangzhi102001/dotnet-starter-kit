using FSH.Framework.Shared.Constants;

namespace FSH.Modules.Organization.Contracts.Authorization;

public static class OrganizationPermissions
{
    public static class Departments
    {
        public const string Resource = "Organization.Departments";
        public const string View   = $"Permissions.{Resource}.View";
        public const string Manage = $"Permissions.{Resource}.Manage";
    }

    public static class Positions
    {
        public const string Resource = "Organization.Positions";
        public const string View   = $"Permissions.{Resource}.View";
        public const string Manage = $"Permissions.{Resource}.Manage";
    }

    public static class UserDepartments
    {
        public const string Resource = "Organization.UserDepartments";
        public const string View   = $"Permissions.{Resource}.View";
        public const string Manage = $"Permissions.{Resource}.Manage";
    }

    public static IReadOnlyList<FshPermission> All { get; } =
    [
        new("View Departments",       ActionConstants.View,   Departments.Resource, IsBasic: true),
        new("Manage Departments",     ActionConstants.Update, Departments.Resource),
        new("View Positions",         ActionConstants.View,   Positions.Resource, IsBasic: true),
        new("Manage Positions",       ActionConstants.Update, Positions.Resource),
        new("View User Departments",  ActionConstants.View,   UserDepartments.Resource, IsBasic: true),
        new("Manage User Departments",ActionConstants.Update, UserDepartments.Resource),
    ];
}
