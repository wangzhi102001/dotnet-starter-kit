using System.Reflection;
using System.Runtime.CompilerServices;
using Asp.Versioning;
using Asp.Versioning.Builder;
using FSH.Framework.Persistence;
using FSH.Framework.Shared.Constants;
using FSH.Framework.Web.Modules;
using FSH.Modules.Organization.Contracts.Authorization;
using FSH.Modules.Organization.Data;
using FSH.Modules.Organization.Features.v1.Departments.CreateDepartment;
using FSH.Modules.Organization.Features.v1.Departments.DeleteDepartment;
using FSH.Modules.Organization.Features.v1.Departments.GetDepartmentById;
using FSH.Modules.Organization.Features.v1.Departments.GetDepartmentTree;
using FSH.Modules.Organization.Features.v1.Departments.UpdateDepartment;
using FSH.Modules.Organization.Features.v1.Positions.CreatePosition;
using FSH.Modules.Organization.Features.v1.Positions.DeletePosition;
using FSH.Modules.Organization.Features.v1.Positions.GetPositions;
using FSH.Modules.Organization.Features.v1.Positions.UpdatePosition;
using FSH.Modules.Organization.Features.v1.UserDepartments.AssignUserDepartment;
using FSH.Modules.Organization.Features.v1.UserDepartments.RemoveUserDepartment;
using FSH.Modules.Organization.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

[assembly: FshModule(typeof(FSH.Modules.Organization.OrganizationModule), 250)]
[assembly: InternalsVisibleTo("Organization.Tests")]

namespace FSH.Modules.Organization;

public sealed class OrganizationModule : IModule
{
    public void ConfigureServices(IHostApplicationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);
        PermissionConstants.Register(OrganizationPermissions.All);
        builder.Services.AddHeroDbContext<OrganizationDbContext>();
        builder.Services.AddScoped<IDbInitializer, OrganizationDbInitializer>();
        builder.Services.AddHealthChecks()
            .AddDbContextCheck<OrganizationDbContext>(name: "db:organization",
                tags: ["database", "organization"]);

        builder.Services.AddTransient<IClaimsTransformation, OrganizationClaimsTransformer>();
        builder.Services.AddScoped<IUserDepartmentService, UserDepartmentService>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        ArgumentNullException.ThrowIfNull(endpoints);
        var versionSet = endpoints.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1))
            .ReportApiVersions()
            .Build();

        var group = endpoints
            .MapGroup("api/v{version:apiVersion}/organization")
            .WithTags("Organization")
            .WithApiVersionSet(versionSet)
            .RequireAuthorization();

        group.MapCreateDepartmentEndpoint();
        group.MapUpdateDepartmentEndpoint();
        group.MapDeleteDepartmentEndpoint();
        group.MapGetDepartmentTreeEndpoint();
        group.MapGetDepartmentByIdEndpoint();

        group.MapCreatePositionEndpoint();
        group.MapUpdatePositionEndpoint();
        group.MapDeletePositionEndpoint();
        group.MapGetPositionsEndpoint();

        group.MapAssignUserDepartmentEndpoint();
        group.MapRemoveUserDepartmentEndpoint();
    }

    public void ConfigureMiddleware(IApplicationBuilder app) { }
}
