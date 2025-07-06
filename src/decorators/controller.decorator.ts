import type { ControllerMetadataParams, RouteMetadataProps } from '@/global'

/**
 * The CONTROLLER decorator is used to register a class as a controller.
 * It receives a partial {@link ControllerMetadataParams} object with the following properties:
 * - version: The version of the controller. If not set, the default version is used.
 * - path: The base path of the controller. If not set, the class name is used as the base path.
 * @param props - The properties of the controller.
 * @returns A function that decorates a class with the CONTROLLER metadata.
 */
export function Controller(props?: ControllerMetadataParams) {
  return function (target: any) {
    // Get the route metadata from the class
    const Routes: RouteMetadataProps[] = Reflect.getMetadata('routes:metadata', target) || []

    Reflect.defineMetadata('controller:metadata', true, target)

    // Marca explicitamente a classe como um controller
    Object.defineProperty(target, '__isController', { value: true })

    // Set the prefix path
    let prefix = ''
    if (props) {
      if (props.version) {
        // If the version property is set, append it to the prefix
        prefix = `${props.version ? '/v' + props.version : ''}`
      }

      if (props.path) {
        // If the path property is set, append it to the prefix
        const basePath = props.path.startsWith('/') ? props.path.slice(1) : props.path
        prefix = prefix + `/${basePath}`
      }
    }

    if (prefix !== '') {
      // If the prefix is not empty, set the prefixed routes
      const prefixedRoutes = Routes.map((route) => {
        const routePath = route.path.startsWith('/') ? route.path.slice(1) : route.path
        return {
          ...route,
          path: prefix + `${routePath ? '/' + routePath : ''}`,
        }
      })
      // Set the prefixed routes as the route metadata of the class
      Reflect.defineMetadata('routes:metadata', prefixedRoutes, target)
    }
  }
}
//TODO registrar uma property na classe decorada para informar que ela e um controller
