import docker
from docker.errors import NotFound, APIError

_client = None


def get_client():
    global _client
    if _client is None:
        _client = docker.from_env()
    return _client


def ensure_network(user_id: str) -> None:
    client = get_client()
    network_name = f"almerno_{user_id}"
    try:
        client.networks.get(network_name)
    except NotFound:
        client.networks.create(network_name, driver="bridge")


def start_container(
    user_id: str,
    app_id: str,
    image: str,
    data_path: str,
    volume_path: str,
    internal_port: int,
    mem_limit: str,
    cpu_quota: int,
    environment: dict,
    container_user: str | None = None,
) -> tuple[str, int]:
    client = get_client()
    container_name = f"almerno_{user_id}_{app_id}"

    # Remove any leftover container with this name before starting fresh
    try:
        old = client.containers.get(container_name)
        old.remove(force=True)
    except NotFound:
        pass

    container = client.containers.run(
        image,
        name=container_name,
        network=f"almerno_{user_id}",
        volumes={volume_path: {"bind": data_path, "mode": "rw"}},
        environment={**environment, "TZ": "UTC"},
        mem_limit=mem_limit,
        cpu_quota=cpu_quota,
        cpu_period=100000,
        ports={f"{internal_port}/tcp": None},
        restart_policy={"Name": "unless-stopped"},
        detach=True,
        security_opt=["no-new-privileges:true"],
        **({"user": container_user} if container_user else {}),
    )

    container.reload()
    port_bindings = container.ports.get(f"{internal_port}/tcp")
    if not port_bindings:
        raise RuntimeError(f"Container started but port {internal_port} was not bound")
    host_port = int(port_bindings[0]["HostPort"])

    return container.id, host_port


def stop_container(container_name: str) -> None:
    client = get_client()
    try:
        container = client.containers.get(container_name)
        container.stop(timeout=10)
        container.remove()
    except NotFound:
        pass


def get_container_status(container_name: str) -> str:
    client = get_client()
    try:
        container = client.containers.get(container_name)
        container.reload()
        return container.status
    except NotFound:
        return "not_found"


def remove_network_if_empty(user_id: str) -> None:
    client = get_client()
    network_name = f"almerno_{user_id}"
    try:
        network = client.networks.get(network_name)
        network.reload()
        if not network.containers:
            network.remove()
    except (NotFound, APIError):
        pass
