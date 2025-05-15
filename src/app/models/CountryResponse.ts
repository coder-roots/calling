export interface CountryResponse{
    data: Country[]
}

export interface Country{
    capital?: string,
    currency?: string,
    currency_name?: string,
    currency_symbol?: string,
    emoji?:  string,
    emojiU?: string,
    id?: string,
    iso2?: string,
    iso3?: string,
    latitute?: string,
    longitude?: string,
    name?: string,
    native?: string,
    numeric_code?: string,
    phone_code?: string,
    region?: string,
    subregion?: string,
    timezones?: string,
    tld?: string
}

export interface StateResponse{
    data: State[]
}

export interface State{
    id?: string,
    name?: string,
    country_id?: string,
    country_code?: string,
    country_name?: string,
    state_code?: string,
    type?: string,
    latitute?:string,
    longitute?: string
}

export interface CityResponse{
    data: City[]
}

export interface City{
    id?: string,
    name?: string,
    state_id?: string,
    state_code?: string,
    state_name?: string,
    country_id?: string,
    country_code?: string,
    country_name?: string,
    latitude?: string,
    longitude?: string,

}