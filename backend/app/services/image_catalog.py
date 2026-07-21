from __future__ import annotations


IMAGE_CATALOG = {
    "lain5g-lab/open5gs:local": ("gually/lain5g-open5gs:2.7.5-lain1", "Core Open5GS 4G/5G"),
    "lain5g-lab/ueransim:local": ("gually/lain5g-ueransim:3.2.6-lain1", "gNB y UE 5G simulados"),
    "lain5g-lab/srsran4g-sim:local": ("gually/lain5g-srsran4g-sim:23.11-lain1", "eNB y UE 4G simulados"),
    "lain5g-lab/srsran4g-uhd:local": ("gually/lain5g-srsran4g-uhd:23.11-uhd4.10-lain1", "srsRAN 4G con UHD/X310"),
    "lain5g-lab/srsranproject-uhd:local": ("gually/lain5g-srsranproject-uhd:24.10.1-uhd4.10-lain1", "srsRAN Project con UHD/X310"),
    "lain5g-lab/kamailio:local": ("gually/lain5g-kamailio:5.8.8-lain1", "Servicios SIP/IMS"),
    "lain5g-lab/ims-dns:local": ("gually/lain5g-ims-dns:1.11.3-lain1", "DNS para IMS"),
    "lain5g-lab/ims-sip:local": ("gually/lain5g-ims-sip:1.0-lain1", "Herramientas SIP de laboratorio"),
}

PROFILE_IMAGES = {
    "4g-lte-sim": ("lain5g-lab/open5gs:local", "lain5g-lab/srsran4g-sim:local", "mongo:7.0"),
    "4g-volte-sim": ("lain5g-lab/open5gs:local", "lain5g-lab/srsran4g-sim:local", "lain5g-lab/kamailio:local", "lain5g-lab/ims-dns:local", "lain5g-lab/ims-sip:local", "mongo:7.0", "mariadb:11"),
    "4g-lte-x310": ("lain5g-lab/open5gs:local", "lain5g-lab/srsran4g-uhd:local", "lain5g-lab/kamailio:local", "lain5g-lab/ims-dns:local", "mongo:7.0", "mariadb:11"),
    "5g-sa": ("lain5g-lab/open5gs:local", "lain5g-lab/ueransim:local", "mongo:7.0"),
    "5g-sa-x310": ("lain5g-lab/open5gs:local", "lain5g-lab/srsranproject-uhd:local", "mongo:7.0"),
    "5g-nsa-x310": ("lain5g-lab/open5gs:local", "lain5g-lab/srsran4g-uhd:local", "lain5g-lab/kamailio:local", "lain5g-lab/ims-dns:local", "mongo:7.0", "mariadb:11"),
    "5g-vonr": ("lain5g-lab/open5gs:local", "lain5g-lab/ueransim:local", "lain5g-lab/kamailio:local", "lain5g-lab/ims-dns:local", "lain5g-lab/ims-sip:local", "mongo:7.0", "mariadb:11"),
}

RF_ACCESS_IMAGES = {
    "4g-lte-x310": "lain5g-lab/srsran4g-uhd:local",
    "5g-sa-x310": "lain5g-lab/srsranproject-uhd:local",
    "5g-nsa-x310": "lain5g-lab/srsran4g-uhd:local",
}


def required_images(profile_id: str, core_only: bool = False) -> list[str]:
    if profile_id == "all":
        images = list(IMAGE_CATALOG) + ["mongo:7.0", "mariadb:11"]
    elif profile_id in PROFILE_IMAGES:
        images = list(PROFILE_IMAGES[profile_id])
        if core_only and profile_id in RF_ACCESS_IMAGES:
            images.remove(RF_ACCESS_IMAGES[profile_id])
    else:
        raise ValueError(f"Unknown image profile: {profile_id}")
    return list(dict.fromkeys(images))
