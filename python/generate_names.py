import pandas as pd
import re
import requests
import os
from names_dataset import NameDataset
from pathlib import Path
from dotenv import load_dotenv


# FIXME: This script is not use anymore since RESTCOUNTRIES is not available anymore for free.
# FIXME: This script is not use anymore since RESTCOUNTRIES is not available anymore for free.
# FIXME: This script is not use anymore since RESTCOUNTRIES is not available anymore for free.

# NOTE: Debugging for edge cases: print(NameWrapper(nd.search("A-C")).describe)


# Path handling
base = Path(__file__).resolve().parent
data_file = base / ".." / "data" / "names.txt"
data_file = data_file.resolve()


# Functions
def convert_to_pd(data: dict) -> pd.DataFrame:
    df = []

    for country, genders in data.items():
        if isinstance(genders, dict):
            for gender, names in genders.items():
                for name in names:
                    df.append(
                        {
                            "name": name,
                            "gender": gender,
                            "country_alpha2": country,
                        }
                    )
        # If genders is not a dict, then its a list of names
        else:
            for name in genders:
                df.append(
                    {"name": name, "gender": None, "country_alpha2": country}
                )

    return pd.DataFrame(df)


def extract_names(
    n: int, cca2: list, rm_non_latin: bool = True
) -> pd.arrays.StringArray:
    # Extract names
    male_names = nd.get_top_names(n=n, gender="Male", use_first_names=True)
    male_names = convert_to_pd(male_names)

    female_names = nd.get_top_names(n=n, gender="Female", use_first_names=True)
    female_names = convert_to_pd(female_names)

    lastnames = nd.get_top_names(n=n, use_first_names=False)
    lastnames = convert_to_pd(lastnames)

    all_names = pd.concat(
        [male_names, female_names, lastnames], ignore_index=True
    )
    all_names_filtered = all_names.loc[all_names["country_alpha2"].isin(cca2)]

    # Remove non-latin
    if rm_non_latin:
        all_names_filtered["is_latin"] = all_names["name"].apply(
            lambda text: is_latin(text, latin_regex)
        )
        all_names_filtered = all_names_filtered[all_names_filtered["is_latin"]]

    # Dedup
    return all_names_filtered["name"].sort_values().unique()


# Pattern: match any character NOT in Latin ranges (U+0000–U+024F)
# TODO: Keep all extended latin chars?
latin_regex = re.compile(r"[^\u0000-\u024F]")


def is_latin(text: str, latin_regex: re.Pattern[str]) -> bool:
    return not bool(re.search(latin_regex, text))


def write_to_txt(names: pd.arrays.StringArray, file_name: str) -> None:
    # Path handling
    base = Path(__file__).resolve().parent
    data_file = base / ".." / "data" / file_name
    data_file = data_file.resolve()

    # Write file
    with data_file.open("w+") as file:
        for name in names:
            file.write(name + "\n")

    print(f"Generated {len(names)} names in {data_file}!")


# Get data ----

# TODO: Change REST countries API to something easier

# Top 20 Countries ----

# Countries
# Select countries  from restcountries API
# fields: https://gitlab.com/restcountries/restcountries/-/blob/master/FIELDS.md
fields = ["codes.alpha_2", "population", "region", "subregion"]
headers = {"Authorization": f"Bearer {restcountries_api_key}"}
url = f"https://api.restcountries.com/countries/v5?response_fields={','.join(fields)}"
response = requests.get(url, headers=headers)
data = response.json()

countries_api = pd.json_normalize(data, record_path=["data", "objects"])

# Names
nd = NameDataset()
countries_names = [c.alpha_2 for c in nd.get_country_codes()]

# Remove countries not present in names dataset
countries_api = countries_api.loc[
    countries_api["codes.alpha_2"].isin(countries_names)
]

# Hyperparams for output
n = 3000  # per country
top_n_countries = 20
countries_api_top = (
    countries_api.sort_values("population", ascending=False)
    .head(top_n_countries)["codes.alpha_2"]
    .tolist()
)

print(f"Top 20 countries:\n{countries_api_top}")

top_20_names = extract_names(n=3000, cca2=countries_api_top)
write_to_txt(top_20_names, "top_20_countries_names.txt")

## Western names ----
western_subregions = [
    "Western Europe",
    "Central Europe",
    "Eastern Europe",
    "North America",
    "Central America",
]

print(countries_api[countries_api["subregion"] == "Algeria"])
exit()
western_countries = countries_api[
    countries_api["subregion"].str.contains("|".join(western_subregions))
]["codes.alpha_2"].tolist()

print(f"Western countries:\n{western_countries}")

western_names = extract_names(n=3000, cca2=western_countries)
write_to_txt(western_names, "western_names.txt")


## European names ----
european_countries = countries_api[
    countries_api["region"].str.contains("Europe")
]["codes.alpha_2"].tolist()

print(f"European countries:\n{european_countries}")

european_names = extract_names(n=3000, cca2=european_countries)
write_to_txt(european_names, "european_names.txt")

## Asian names ----
asian_countries = countries_api[countries_api["region"].str.contains("Asia")][
    "codes.alpha_2"
].tolist()

print(f"Asian countries: {asian_countries}")

asian_names = extract_names(n=3000, cca2=asian_countries)
write_to_txt(asian_names, "asian_names.txt")
